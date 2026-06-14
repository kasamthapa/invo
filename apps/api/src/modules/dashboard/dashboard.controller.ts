import { Response } from 'express'
import { AuthRequest } from '../../middleware/authenticate.js'
import * as dashboardService from './dashboard.service.js'

export async function getSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const dashboard = await dashboardService.getOwnerDashboard(req.user!.storeId)
    res.json(dashboard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getStaffView(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user!.role === 'OWNER') {
      const dashboard = await dashboardService.getOwnerDashboard(req.user!.storeId)
      res.json(dashboard)
    } else {
      const dashboard = await dashboardService.getStaffDashboard(req.user!.storeId)
      res.json(dashboard)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
