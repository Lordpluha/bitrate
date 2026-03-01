'use client'

class DateUtilsClass {
  formatDate(date: Date | string | number) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
}

export const DateUtils = new DateUtilsClass()
