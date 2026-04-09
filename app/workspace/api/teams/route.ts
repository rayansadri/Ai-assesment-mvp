import { initializeStore } from '@/lib/seed'
import store from '@/lib/store'

initializeStore()

export async function GET() {
  const teams = store.getTeams()
  return Response.json(teams)
}
