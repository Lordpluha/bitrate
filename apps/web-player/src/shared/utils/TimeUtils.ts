class TimeUtilsClass {
  formatDuration(duration: number) {
    const durationMinutes = Math.floor(duration / 60)
    const durationHours = Math.floor(durationMinutes / 60)
    const durationText =
      durationHours > 0
        ? `${durationHours} hr ${durationMinutes % 60} min`
        : `${durationMinutes} min`

    return durationText
  }
}

export const TimeUtils = new TimeUtilsClass()
