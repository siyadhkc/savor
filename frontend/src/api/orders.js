import api from './axios'

const extractList = (response) => response.data?.results ?? response.data

export const listOrders = async () => {
    const response = await api.get('/orders/orders/')
    return extractList(response)
}

export const createOrder = async (payload) => {
    const response = await api.post('/orders/orders/', payload)
    return response.data
}

export const updateOrderStatus = async (orderId, status) => {
    const response = await api.post(`/orders/${orderId}/update-status/`, { status })
    return response.data
}

export const assignDeliveryAgent = async (orderId, deliveryAgentId) => {
    const response = await api.post(`/orders/${orderId}/assign-delivery/`, {
        delivery_agent_id: deliveryAgentId,
    })
    return response.data
}

export const updateDeliveryLocation = async (orderId, payload) => {
    const response = await api.post(`/orders/${orderId}/update-location/`, payload)
    return response.data
}

export const getOrderLocation = async (orderId) => {
    const response = await api.get(`/orders/${orderId}/location/`)
    return response.data
}

export const getDeliveryAgents = async () => {
    const response = await api.get('/users/delivery-agents/')
    return extractList(response)
}

export const downloadInvoice = async (orderId) => (
    api.get(`/orders/${orderId}/invoice/`, { responseType: 'blob' })
)
