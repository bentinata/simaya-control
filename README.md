SiMAYA Encryption Key Manager Server
==============

Default port is `8080`.

Add server:
`curl -X POST -d name=servername&ip=serverip&status=ok localhost:8080/api/server`

Get servers data:
`curl -X GET localhost:8080/api/server`

Get individual server data:
`curl -X GET localhost:8080/api/servers/servername`

Disable server:
`curl -X PUT localhost:8080/api/servers/servername/disable`
Warning: This will reboot the server immediatly!

Enable server:
`curl -X PUT localhost:8080/api/servers/servername/enable`
