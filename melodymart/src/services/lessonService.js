/**
 * Lesson Service - API integration for lesson-related requests
 */

const API_BASE = 'http://localhost:5000/api'

export const lessonService = {
  /**
   * Fetch all lessons enrolled by the current student
   */
  async getMyLessons() {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE}/lessons/student/my-lessons`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch lessons')
    }

    const data = await response.json()
    return data.lessons || []
  },

  /**
   * Cancel a lesson booking
   */
  async cancelLesson(lessonId) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE}/lessons/${lessonId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to cancel lesson')
    }

    return await response.json()
  },

  /**
   * Request to reschedule a lesson
   */
  async requestReschedule(lessonId, newDate, newTime) {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE}/lessons/${lessonId}/reschedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newDate,
        newTime
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to request reschedule')
    }

    return await response.json()
  },

  /**
   * Get a single lesson details
   */
  async getLessonDetails(lessonId) {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch lesson details')
    }

    const data = await response.json()
    return data.lesson
  }
}

export default lessonService
