# Motorradfreunde Filebase Viewer

A standalone HTML application to view and download files from the Motorradfreunde Rheinneckar forum filebase.

## Features

- ✅ Pure client-side JavaScript (jQuery + Bootstrap)
- ✅ Modern, responsive UI
- ✅ Secure authentication
- ✅ Debug console for troubleshooting
- ✅ Multiple API fallback strategies
- ✅ File listing and download

## Usage

### Option 1: Host on the Forum Domain (Recommended)

To avoid CORS issues, upload `filebase-viewer.html` to the Motorradfreunde server:

1. Upload the file to: `https://motorradfreunde-rheinneckar.de/filebase-viewer.html`
2. Access it at that URL
3. Login with your forum credentials
4. View and download files

**This is the most secure and reliable approach** because:
- No CORS issues (same-origin)
- Uses existing session cookies
- No credential exposure across domains

### Option 2: Test Locally (May Hit CORS)

1. Open `filebase-viewer.html` in your browser
2. Try to login
3. If you see CORS errors in the debug console, you'll need to use Option 1

## CORS Explanation

**What is CORS?**
Cross-Origin Resource Sharing (CORS) is a browser security feature that prevents websites from making requests to different domains.

**Why might this not work from another domain?**
- The WoltLab forum uses cookie-based authentication
- Browsers block cross-origin requests with credentials by default
- The server must explicitly allow CORS with the `Access-Control-Allow-Origin` header

**How to fix CORS issues:**

1. **Best Solution**: Host the HTML file on the same domain (motorradfreunde-rheinneckar.de)

2. **Alternative**: Configure CORS on the server
   - Add these headers to the WoltLab API responses:
   ```
   Access-Control-Allow-Origin: https://yourdomain.com
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST
   Access-Control-Allow-Headers: Content-Type, X-Requested-With
   ```

3. **Development Only**: Use a CORS proxy or browser extension (NOT secure for production)

## How It Works

### Authentication Flow

1. User enters credentials in the login form
2. JavaScript attempts to POST to `/wcf/login/` with credentials
3. If successful, session cookie is stored by the browser
4. Subsequent requests include the session cookie automatically

### File Loading Flow

The application tries multiple approaches to load files:

1. **RPC API**: Attempts various RPC endpoints:
   - `/wcf/api/rpc/filebase/files`
   - `/wcf/api/rpc/filebase/entries`
   - Other potential endpoints

2. **HTML Scraping**: If API fails, parses the filebase HTML page
   - Extracts file links and metadata
   - Works as a fallback if API is unavailable

### Debug Console

The built-in debug console shows:
- Authentication attempts
- API endpoint tries
- CORS errors
- Parsing results
- All network activity

Use this to troubleshoot issues!

## Security Considerations

### Client-Side Security

✅ **What's Secure:**
- All code runs in the browser
- Credentials are only sent to the official forum
- No third-party servers involved
- Uses HTTPS for all requests

⚠️ **Important Notes:**
- Credentials are never stored (only in memory during login)
- Session cookies are managed by the browser
- Code can be inspected (it's open source)

### Hosting Recommendations

1. **Best**: Upload to motorradfreunde-rheinneckar.de
   - Same domain = maximum security
   - No CORS issues
   - Uses existing forum security

2. **Good**: Host on your own HTTPS domain
   - Requires CORS configuration on forum
   - Keep the file read-only

3. **Not Recommended**: HTTP hosting or public servers
   - Credentials could be exposed
   - Man-in-the-middle attacks possible

## Technical Details

### Dependencies

- jQuery 3.7.1
- Bootstrap 5.3.0
- Modern browser with ES6 support

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### API Endpoints Tried

The application attempts these endpoints (in order):

1. `https://motorradfreunde-rheinneckar.de/wcf/api/rpc/filebase/files`
2. `https://motorradfreunde-rheinneckar.de/wcf/api/rpc/filebase/entries`
3. `https://motorradfreunde-rheinneckar.de/wcf/api/index.php?filebase/FileList`
4. HTML parsing of `https://motorradfreunde-rheinneckar.de/filebase/`

### Customization

You can customize the `CONFIG` object in the JavaScript:

```javascript
const CONFIG = {
    baseUrl: 'https://motorradfreunde-rheinneckar.de',
    loginUrl: 'https://motorradfreunde-rheinneckar.de/wcf/login/',
    apiUrl: 'https://motorradfreunde-rheinneckar.de/wcf/api',
    rpcApiUrl: 'https://motorradfreunde-rheinneckar.de/wcf/api/rpc',
    filebaseUrl: 'https://motorradfreunde-rheinneckar.de/filebase/'
};
```

## Troubleshooting

### CORS Error
**Error**: "CORS Error: Der Server erlaubt keine Cross-Origin Anfragen"

**Solution**: Upload the HTML file to motorradfreunde-rheinneckar.de

### Login Failed
**Error**: "Ungültige Anmeldedaten"

**Solution**:
- Check username and password
- Make sure your account is active
- Try logging in on the forum website first

### No Files Found
**Error**: "Keine Dateien gefunden"

**Possible causes**:
- Filebase is empty
- API endpoints have changed
- Permissions issue (check if you can access filebase when logged in normally)

**Solution**: Check the debug console for details

## Contributing

This is a proof-of-concept. Possible improvements:

- [ ] Discover exact WoltLab Filebase API endpoints
- [ ] Add file search/filter functionality
- [ ] Support for GPX file preview
- [ ] Batch download capability
- [ ] File categories/folders
- [ ] Upload functionality

## License

This is a custom tool for the Motorradfreunde Rheinneckar community.

## Credits

- Built for Motorradfreunde Rheinneckar forum users
- Uses WoltLab Suite API
- Bootstrap UI framework
- jQuery for AJAX

## Support

If you encounter issues:

1. Check the debug console in the application
2. Try hosting on the forum domain
3. Test your credentials on the forum website
4. Check browser console (F12) for errors

## References

- [WoltLab Suite RPC API Documentation](https://docs.woltlab.com/6.1/php/api/rpc_api/)
- [WoltLab Suite JavaScript API](https://docs.woltlab.com/6.1/javascript/components_rpc_api/)
- [CORS Explained (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
