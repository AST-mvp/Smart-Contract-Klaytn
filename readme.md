# Smart-Contract-Klaytn

## POST `/login`

Login to our system

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

## POST `/auth/oauth/kakao`

OAuth 2.0 social login (kakao)

```json
// payload
{
    "accessToken": ""
}
```

```json
// response
{
    "result": "success",
    "token": ""
}
```

## POST `/auth/oauth/google`

OAuth 2.0 social login (google)

```json
// payload
{
    "accessToken": ""
}
```

```json
// response
{
    "result": "success",
    "token": ""
}
```

## GET `/login`

Check login status

```json
// response
{
    "result": true
}
```

## GET `/users/me`

Returns my profile info

header|value
|--|--|
Authorization|`Bearer <token>`|

```json
// response
{
    "username": "",
    "userID": "",
    "isAdmin":
}
```

## POST `/users/register`

Register new user

header|value
|--|--|
Authorization|`Bearer <token>`|

- requires admin previlege

```json
// payload
{
    "id": "",
    "pw": "",
    "isAdmin":
}
```

```json
// response
{
    result: "success"
}
```

## GET `/products`

Returns all products registered in blockchain network for admin

header|value
|--|--|
Authorization|`Bearer <token>`|

- requires admin previlege

```json
// response
{
    "products": [
        {
            "nfcID": "",
            "brandID": "",
            "productID": "",
            "editionID": "",
            "manufactureDate": "",
            "limited": ,
            "drop": ,
            "ownerID": ""
        }
    ]
}
```

## POST `/products`

Register new product

header|value
|--|--|
Authorization|`Bearer <token>`|

- requires admin previlege

```json
// payload
{
    "nfcID": ,
    "brandID": "",
    "productID": "",
    "editionID": "",
    "manufactureDate": "",
    "limited": ,
    "drop": ,
    "ownerID":
}
```

```json
// response
{
    result: "nfcID already exists"
    result: "success",
}
```

## GET `/products/:nfcid`

Search my product by nfcID value

header|value
|--|--|
Authorization|`Bearer <token>`|

```json
// response
{
    "products": {
        "nfcID": "",
        "brandID": "",
        "productID": "",
        "editionID": "",
        "manufactureDate": "",
        "limited": ,
        "drop": ,
        "ownerID": ""
    }
}
```

## POST `/products/trade`

Trade my product to someone else

header|value
|--|--|
Authorization|`Bearer <token>`|

```json
// payload
{
    "nfcID" : ,
    "userID": 
}
```

```json
// response
{
    result: "success"
}
```

## GET `/closet`

Returns my products

header|value
|--|--|
Authorization|`Bearer <token>`|

```json
// response
{
    "products": {
        "nfcID": "",
        "brandID": "",
        "productID": "",
        "editionID": "",
        "manufactureDate": "",
        "limited": ,
        "drop": ,
        "ownerID": ""
    }
}
```

## GET `/drops`

Returns dropped products

header|value
|--|--|
Authorization|`Bearer <token>`|

```json
// response
{
    "products": {
        "nfcID": "",
        "brandID": "",
        "productID": "",
        "editionID": "",
        "manufactureDate": "",
        "limited": ,
        "drop": ,
        "ownerID": ""
    }
}
```