export function formatNPR(paisa: number): string {
  const rupees = paisa / 100
  return 'NPR ' + rupees.toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
