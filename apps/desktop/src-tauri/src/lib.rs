#[cfg(desktop)]
use std::collections::HashMap;
#[cfg(desktop)]
use std::thread;
#[cfg(desktop)]
use tauri::{AppHandle, Emitter};
#[cfg(desktop)]
use tauri_plugin_stronghold::Builder as StrongholdBuilder;
#[cfg(desktop)]
use tiny_http::{Response, Server};
#[cfg(desktop)]
use url::form_urlencoded;

#[cfg(desktop)]
const OAUTH_SERVER_PORT: u16 = 1421;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init());

    // Desktop-only: Stronghold vault with machine-ID derived key
    #[cfg(desktop)]
    let app = app.plugin(
        StrongholdBuilder::new(|password| {
            // Derive Stronghold vault key from machine ID via Argon2
            // Salt = machine ID bytes → key is unique per device
            use argon2::Argon2;
            let machine_id = get_machine_id();
            let salt = machine_id.as_bytes();
            let argon2 = Argon2::default();
            let mut key = vec![0u8; 32];
            argon2
                .hash_password_into(password.as_bytes(), salt, &mut key)
                .expect("Argon2 key derivation failed");
            key
        })
        .build(),
    );

    let app = app.setup(|app| {
        // Register deep-link schemes declared in tauri.conf.json
        #[cfg(desktop)]
        {
            use tauri_plugin_deep_link::DeepLinkExt;
            if let Err(e) = app.deep_link().register_all() {
                eprintln!("deep-link registration skipped: {e}");
            }
        }
        Ok(())
    })
        .invoke_handler(tauri::generate_handler![get_machine_id_cmd]);

    // Register desktop-specific commands (start_oauth_server uses tiny_http)
    #[cfg(desktop)]
    let app = app.invoke_handler(tauri::generate_handler![start_oauth_server]);

    app.run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Starts a local HTTP server on 127.0.0.1:{port} to capture the OAuth redirect.
/// The server listens for a single request to `/callback?code=...&state=...`,
/// emits the result as a Tauri event, then continues listening (avoids race
/// with the browser closing the connection).
///
/// Desktop-only: mobile uses deep-link OAuth instead.
#[cfg(desktop)]
#[tauri::command]
fn start_oauth_server(app_handle: AppHandle) -> Result<u16, String> {
    let addr = format!("127.0.0.1:{}", OAUTH_SERVER_PORT);
    let server =
        Server::http(&addr).map_err(|e| format!("Failed to start OAuth server on {addr}: {e}"))?;

    let port = server
        .server_addr()
        .to_ip()
        .map(|ip| ip.port())
        .unwrap_or(OAUTH_SERVER_PORT);

    thread::spawn(move || {
        for request in server.incoming_requests() {
            let url = request.url().to_string();
            let params: HashMap<String, String> =
                form_urlencoded::parse(url.split('?').nth(1).unwrap_or("").as_bytes())
                    .into_owned()
                    .collect();

            if let (Some(code), Some(state)) = (params.get("code"), params.get("state")) {
                let _ = app_handle.emit(
                    "oauth-code-received",
                    serde_json::json!({ "code": code, "state": state }),
                );
                let _ = request.respond(
                    Response::from_string("Login successful! You can close this window."),
                );
            } else {
                let _ = request.respond(
                    Response::from_string("Missing code or state parameter.")
                        .with_status_code(400),
                );
            }
        }
    });

    Ok(port)
}

/// Exposed to frontend via `invoke("get_machine_id")` for Stronghold password derivation.
#[tauri::command]
fn get_machine_id_cmd() -> String {
    get_machine_id()
}

/// Returns the hardware machine ID on desktop, falling back to a random UUID.
/// On mobile, always returns a random UUID (no hardware ID access).
#[cfg(desktop)]
fn get_machine_id() -> String {
    machine_uid::get().unwrap_or_else(|_| uuid::Uuid::new_v4().to_string())
}

#[cfg(mobile)]
fn get_machine_id() -> String {
    uuid::Uuid::new_v4().to_string()
}
