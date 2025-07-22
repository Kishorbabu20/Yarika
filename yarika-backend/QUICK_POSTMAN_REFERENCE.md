# Quick Postman Reference - Yarika Orders

## 🔐 Authentication

### User Login
```
POST https://yarika.in/api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

### Admin Login
```
POST https://yarika.in/api/admin/login
Content-Type: application/json

{
  "email": "admin@yarika.com",
  "password": "admin123"
}
```

## 📦 Order Creation

### Create Order
```
POST https://yarika.in/api/orders/add
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "quantity": 1,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phoneNumber": "9876543210"
  }
}
```

## 📋 Get Data

### Get Products
```
GET https://yarika.in/api/products
Authorization: Bearer YOUR_USER_TOKEN
```

### Get User Orders
```
GET https://yarika.in/api/orders
Authorization: Bearer YOUR_USER_TOKEN
```

### Get All Orders (Admin)
```
GET https://yarika.in/api/orders/all
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## 🔄 Update Order Status

### Update Status
```
PUT https://yarika.in/api/orders/ORDER_ID_HERE/status
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "Processing"
}
```

## 🧪 Test Endpoints

### Test Authentication
```
GET https://yarika.in/api/orders/test-auth
Authorization: Bearer YOUR_USER_TOKEN
```

### Debug Routes
```
GET https://yarika.in/api/orders/debug
```

## 📱 Notification Testing

After creating an order, check your backend console for:
- ✅ SMS confirmation logs
- ✅ Email confirmation logs
- ✅ Order creation success

## 🚨 Common Headers

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

## 🔧 Environment Variables

Set these in Postman environment:
- `base_url`: `https://yarika.in`
- `user_token`: (from login response)
- `admin_token`: (from admin login response)
- `product_id`: (from products response)
- `order_id`: (from order creation response)

## 📝 Quick Test Flow

1. **Login User** → Get `user_token`
2. **Get Products** → Get `product_id`
3. **Create Order** → Get `order_id`
4. **Login Admin** → Get `admin_token`
5. **Update Status** → Test notifications

## ⚠️ Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (product/order not found)
- `500` - Server Error (check backend logs) 