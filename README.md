SiMAYA Encryption Key Manager Server
==============

Default port is `8080`.

Add server:
```
curl -X POST -d name=servername&ip=serverip&status=ok localhost:8080/api/server
```

Get servers data:
```
curl -X GET localhost:8080/api/server
```

Get individual server data:

```
curl -X GET localhost:8080/api/servers/servername
```

Get server stats:

```
curl -X GET localhost:8080/api/stats/servername
```

If somehow server got attacked, you can disable server immediatly.
Disable server:

```
curl -X PUT localhost:8080/api/servers/servername/disable
```
Warning: This will disabling the server immediatly!

Re-enable server:

```
curl -X PUT localhost:8080/api/servers/servername/enable
```

If somehow, someone got access to server, you can re-create key, and render existing key useless.
New key will saved at server.

```
curl -X PUT localhost:8080/api/servers/servername/key
```