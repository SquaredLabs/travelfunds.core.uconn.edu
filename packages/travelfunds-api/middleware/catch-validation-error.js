module.exports = () => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof ctx.db.Sequelize.ValidationError) {
      ctx.status = 400
    } else {
      throw err
    }
  }
}
