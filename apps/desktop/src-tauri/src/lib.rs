use tauri::Manager;
use tauri_plugin_stronghold::Builder as StrongholdBuilder;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
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
        )
        .setup(|app| {
            // Register deep-link schemes declared in tauri.conf.json
            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;   // plan fix #18
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_machine_id_cmd])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Exposed to frontend via `invoke("get_machine_id")` for Stronghold password derivation.
#[tauri::command]
fn get_machine_id_cmd() -> String {
    get_machine_id()
}

/// Returns the hardware machine ID, falling back to a stable random UUID if unavailable.
fn get_machine_id() -> String {
    machine_uid::get().unwrap_or_else(|_| uuid::Uuid::new_v4().to_string())
}
