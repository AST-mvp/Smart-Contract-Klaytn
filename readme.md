# Smart-Contract-Klaytn

## POST `/login`

```json
// payload
{
    "id": "",
    "pw": ""
}
```

```json
// response
{
    "result": "success",
    "access_token": ""
}
```

### account.db

name|pw|userid|isAdmin|
|--|--|--|--|
admin|`sha256("admin")`|2001|1
test1|`sha256("1111")`|2002|0
test2|`sha256("2222")`|2003|0
test3|`sha256("3333")`|2004|0
test4|`sha256("4444")`|2005|1
test5|`sha256("5555")`|5026|1

## GET `/login`

```json
// response
{
    "result": true
}
```

## GET `/users/me`

```json
// response
{
    "username": "",
    "userID": "",
    "isAdmin":
}
```

## POST `/users/register`

```json
// payload
{
    "id": "",
    "pw": "",
    "isAdmin":
}
```