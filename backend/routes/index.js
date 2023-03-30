const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /healthcheck:
 *  get:
 *     tags:
 *      - Healthcheck
 *     description: Returns API operational status
 *     responses:
 *       200:
 *         description: API is  running
 */
router.get('/healthcheck', (req, res) => res.sendStatus(200))

/**
 * @openapi
 * /:
 *  get:
 *     tags:
 *      - Index
 *     description: Returns the API name
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', function(req, res, next) {
  res.json({ title: 'Gateways API' });
});



module.exports = router;
