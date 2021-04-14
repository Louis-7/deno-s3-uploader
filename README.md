# Deno File Uploader

A Deno file upload practise. Upload file to S3.

## Install

Follow the [Deno installation instruction](https://deno.land/manual@v1.9.0/getting_started/installation). 

I use VS Code as my code editor. Search `deno` in extension manager and install it. This is what my `settings.json` looks like:

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.suggest.imports.hosts": {
    "https://deno.land": true
  },
  "deno.unstable": true,
  "deno.suggest.completeFunctionCalls": true,
}
```

Find `config.js.example`, make a copy and rename it to `config.js`

## Run

Execute `deno run --unstable --allow-net --allow-read --allow-env src/file-upload.ts` in terminal.

