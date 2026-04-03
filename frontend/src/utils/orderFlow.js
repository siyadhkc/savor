export const ADMIN_MANUAL_STATUSES = ['pending', 'preparing', 'cancelled']

export const RESTAURANT_MANUAL_STATUSES = ['pending', 'preparing', 'cancelled']

const CUSTOMER_TIMELINE = [
    {
        key: 'placed',
        title: 'Order placed',
        description: 'Your order has been placed successfully.',
    },
    {
        key: 'preparing',
        title: 'Preparing your food',
        description: 'The restaurant is getting everything ready.',
    },
    {
        key: 'assigned',
        title: 'Rider assigned',
        description: 'A delivery partner has been assigned to your order.',
    },
    {
        key: 'picked',
        title: 'Picked up',
        description: 'Your food has been picked up from the restaurant.',
    },
    {
        key: 'delivering',
        title: 'On the way',
        description: 'Your rider is on the way to you.',
    },
    {
        key: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered.',
    },
]

export const getAdminStatusOptions = (order) => {
    if (['delivered', 'out_for_delivery'].includes(order.status)) {
        return [order.status]
    }

    if (order.delivery_status && ['picked', 'delivering', 'delivered'].includes(order.delivery_status)) {
        return [order.status]
    }

    if (order.status === 'preparing') {
        return ['preparing', 'cancelled']
    }

    if (order.status === 'pending') {
        return ['pending', 'preparing', 'cancelled']
    }

    return [order.status]
}

export const getRestaurantStatusOptions = (order) => {
    if (order.status === 'pending') {
        return ['pending', 'preparing', 'cancelled']
    }

    if (
        order.status === 'preparing' &&
        (!order.delivery_status || ['assigned', 'accepted'].includes(order.delivery_status))
    ) {
        return ['preparing', 'cancelled']
    }

    return [order.status]
}

export const getCustomerStatusCopy = (order) => {
    if (order.status === 'cancelled') return 'Cancelled'
    if (order.status === 'delivered') return 'Delivered'
    if (order.delivery_status === 'delivering') return 'On the way'
    if (order.delivery_status === 'picked') return 'Picked up by rider'
    if (order.delivery_status === 'accepted') return 'Rider accepted the order'
    if (order.delivery_status === 'assigned') return 'Rider assigned'
    if (order.status === 'preparing') return 'Preparing your food'
    return 'Order placed'
}

const getTimelineStepIndex = (order) => {
    if (order.status === 'cancelled') return -1
    if (order.status === 'delivered') return 5
    if (order.delivery_status === 'delivering') return 4
    if (order.delivery_status === 'picked') return 3
    if (order.delivery_status === 'accepted' || order.delivery_status === 'assigned') return 2
    if (order.status === 'preparing') return 1
    return 0
}

export const getCustomerTimeline = (order) => {
    if (order.status === 'cancelled') {
        return [
            {
                key: 'cancelled',
                title: 'Order cancelled',
                description: 'This order was cancelled before delivery was completed.',
                state: 'current',
            },
        ]
    }

    const currentIndex = getTimelineStepIndex(order)

    return CUSTOMER_TIMELINE.map((step, index) => ({
        ...step,
        state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
    }))
}

export const getDeliveryAgentStatusLabel = (status) => {
    switch (status) {
        case 'assigned':
            return 'New assignment'
        case 'accepted':
            return 'Heading to restaurant'
        case 'picked':
            return 'Ready to start trip'
        case 'delivering':
            return 'On the way'
        case 'delivered':
            return 'Delivered'
        default:
            return 'Awaiting update'
    }
}
