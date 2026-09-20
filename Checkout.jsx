import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Checkout = () => {
  const navigate = useNavigate()

  const [orderItems, setOrderItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    paymentMethod: 'COD',
    notes: ''
  })

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        toast.error('Please sign in first')
        navigate('/login')
        return
      }

      const response = await axios.get('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('CHECKOUT CART:', response.data)

      if (response.data.success) {
        setOrderItems(response.data.items || [])
        setSubtotal(response.data.subtotal || 0)
      }
    } catch (error) {
      console.error('FETCH CART ERROR:', error)
      toast.error('Unable to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const placeOrder = async (e) => {
    e.preventDefault()

    console.log('PLACE ORDER CLICKED')

    if (!formData.address.trim()) {
      toast.error('Please enter your address')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    try {
      setPlacingOrder(true)

      const token = localStorage.getItem('token')

      console.log('TOKEN EXISTS:', !!token)
      console.log('ORDER ITEMS BEFORE FORMAT:', orderItems)

      if (!token) {
        toast.error('Please sign in first')
        navigate('/login')
        return
      }

      const formattedItems = orderItems.map((item) => {
        const productId =
          item.product?._id ||
          item.product?.id ||
          item.productId ||
          item._id

        return {
          product: productId,
          quantity: item.quantity,
          price: item.price || item.product?.price || 0
        }
      })

      console.log('FORMATTED ORDER ITEMS:', formattedItems)

      const orderData = {
        items: formattedItems,
        shippingAddress: formData.address,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        totalAmount: subtotal,
        notes: formData.notes
      }

      console.log('ORDER DATA:', orderData)

      const response = await axios.post(
        '/api/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('ORDER SUCCESS:', response.data)

      toast.success('Order placed successfully!')

      setTimeout(() => {
        navigate('/orders')
      }, 1000)

    } catch (error) {
      console.error('ORDER ERROR:', error)

      console.error(
        'SERVER RESPONSE:',
        error.response?.data
      )

      toast.error(
        error.response?.data?.message ||
        'Failed to place order'
      )

    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading checkout...
      </div>
    )
  }

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        <h1 style={styles.title}>
          Checkout
        </h1>

        <div style={styles.content}>

          {/* SHIPPING DETAILS */}

          <div style={styles.left}>

            <div style={styles.card}>

              <h2 style={styles.heading}>
                Shipping Details
              </h2>

              <form onSubmit={placeOrder}>

                <label style={styles.label}>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                  rows="4"
                  style={styles.textarea}
                />

                <label style={styles.label}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  style={styles.input}
                />

                <label style={styles.label}>
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="COD">
                    Cash on Delivery
                  </option>

                  <option value="CARD">
                    Card
                  </option>

                  <option value="UPI">
                    UPI
                  </option>
                </select>

                <label style={styles.label}>
                  Order Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions"
                  rows="3"
                  style={styles.textarea}
                />

                <button
                  type="submit"
                  disabled={placingOrder}
                  style={{
                    ...styles.button,
                    opacity: placingOrder ? 0.6 : 1
                  }}
                >
                  {placingOrder
                    ? 'Placing Order...'
                    : 'Place Order'}
                </button>

              </form>

            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div style={styles.right}>

            <div style={styles.card}>

              <h2 style={styles.heading}>
                Order Summary
              </h2>

              {orderItems.map((item, index) => {

                const product =
                  item.product || item

                const itemPrice =
                  item.price ||
                  product.price ||
                  0

                return (
                  <div
                    key={item._id || index}
                    style={styles.item}
                  >

                    <div>

                      <strong>
                        {product.name || 'Product'}
                      </strong>

                      <div style={styles.quantity}>
                        Quantity: {item.quantity}
                      </div>

                    </div>

                    <div>
                      ₹
                      {(
                        itemPrice *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                  </div>
                )
              })}

              <div style={styles.line}></div>

              <div style={styles.total}>
                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{Number(subtotal).toFixed(2)}
                </strong>
              </div>

              <div style={styles.total}>
                <span>
                  Shipping
                </span>

                <strong>
                  FREE
                </strong>
              </div>

              <div style={styles.line}></div>

              <div style={styles.grandTotal}>
                <span>
                  Total
                </span>

                <strong>
                  ₹{Number(subtotal).toFixed(2)}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

const styles = {

  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '40px 20px'
  },

  container: {
    maxWidth: '1100px',
    margin: '0 auto'
  },

  title: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#222'
  },

  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '25px'
  },

  left: {
    width: '100%'
  },

  right: {
    width: '100%'
  },

  card: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },

  heading: {
    marginBottom: '20px',
    color: '#333'
  },

  label: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#444'
  },

  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box'
  },

  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '15px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },

  button: {
    width: '100%',
    padding: '14px',
    marginTop: '25px',
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  item: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    padding: '12px 0',
    borderBottom: '1px solid #eee'
  },

  quantity: {
    fontSize: '13px',
    color: '#777',
    marginTop: '5px'
  },

  line: {
    height: '1px',
    backgroundColor: '#ddd',
    margin: '18px 0'
  },

  total: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    color: '#555'
  },

  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '20px',
    color: '#111'
  },

  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  }

}

export default Checkout