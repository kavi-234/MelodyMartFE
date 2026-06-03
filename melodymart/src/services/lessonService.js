const API_BASE = 'http://localhost:5000/api'

const authHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No authentication token found')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export const lessonService = {
  async getMyLessons() {
    const response = await fetch(`${API_BASE}/lessons/student/my-lessons`, {
      method: 'GET',
      headers: authHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch lessons')
    }
    const data = await response.json()
    return data.lessons || []
  },

  async cancelLesson(lessonId) {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/cancel`, {
      method: 'POST',
      headers: authHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to cancel lesson')
    }
    return await response.json()
  },

  async requestReschedule(lessonId, newDate, newTime) {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/reschedule`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ newDate, newTime })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to request reschedule')
    }
    return await response.json()
  },

  async getLessonDetails(lessonId) {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to fetch lesson details')
    const data = await response.json()
    return data.lesson
  },

  // Enroll in a lesson (uses existing /enroll endpoint)
  async bookLesson(lessonId) {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/enroll`, {
      method: 'POST',
      headers: authHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to book lesson')
    }
    return await response.json()
  },

  // Fetch booking details for the payment return page — returns { paymentStatus, bookingStatus }
  async getBookingDetails(lessonId) {
    const response = await fetch(`${API_BASE}/payments/lessons/${lessonId}/booking`, {
      method: 'GET',
      headers: authHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch booking details')
    }
    const data = await response.json()
    return data.booking
  },

  // Initiate PayHere payment for a lesson booking — returns { actionUrl, payload }
  // Backend: implement POST /api/payments/lessons/:lessonId/initiate
  async initiatePayment(lessonId, lessonData) {
    const response = await fetch(`${API_BASE}/payments/lessons/${lessonId}/initiate`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        amount: lessonData?.price,
        lessonTitle: lessonData?.title
      })
    })

    if (!response.ok) {
      let msg = 'Payment initiation failed'
      try {
        const err = await response.json()
        msg = err.message || msg
      } catch {
        msg = `Payment endpoint returned ${response.status}. Backend needs POST /api/payments/lessons/:id/initiate.`
      }
      throw new Error(msg)
    }
    return await response.json()
  },

  // Reconcile payment status after PayHere return redirect
  async reconcilePayment(bookingId) {
    const response = await fetch(`${API_BASE}/payments/lessons/${bookingId}/reconcile`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'x-payhere-reconcile-source': 'return'
      },
      body: JSON.stringify({ source: 'return' })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reconcile payment')
    }
    return await response.json()
  }
}

export default lessonService
