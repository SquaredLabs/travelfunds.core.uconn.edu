const whitelist = [
  { method: 'post', path: '/api/trips' }
]

module.exports = () => async (ctx, next) => {
  const admin = await ctx.db.Administrator.findOne({
    where: { netid: ctx.session.netid }
  })
  const isAdministrator = admin !== null

  const inWhitelist = whitelist.some(x =>
    x.method === ctx.method && x.path === ctx.path)

  if (inWhitelist || isAdministrator) {
    return await next()
  }

  ctx.status = 401
}
