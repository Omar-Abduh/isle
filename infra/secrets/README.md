# JWT Key Secrets

These files are mounted into the backend container via Docker secrets.
**Never commit real keys to version control.**

Generate a 2048-bit RSA key pair:

```bash
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -outform PEM -out jwt_private.pem
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
```

Then place `jwt_private.pem` and `jwt_public.pem` in this directory.
They are gitignored and loaded as Docker secrets at runtime.
