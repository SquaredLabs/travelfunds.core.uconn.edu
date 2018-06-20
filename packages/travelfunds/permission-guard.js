const whitelist = [
  { method: 'post', path: '/api/trips' },
  { method: 'get', path: /^\/api\/faculty\/.*\/fair-share-left$/ }
]

module.exports = () => async (ctx, next) => {
  const admin = await ctx.db.Administrator.findOne({
    where: { netid: ctx.session.netid }
  })
  const isAdministrator = admin !== null

  const inWhitelist = whitelist.some(x => {
    const pathMatches = (x.path instanceof RegExp)
      ? x.path.test(ctx.path)
      : x.path === ctx.path
    const methodMatches = x.method.toLowerCase() === ctx.method.toLowerCase()
    return methodMatches && pathMatches
  })

  if (inWhitelist || isAdministrator) {
    return await next()
  }

  ctx.status = 401
}
