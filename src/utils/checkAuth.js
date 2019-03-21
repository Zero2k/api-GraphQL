const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context) => {
      await resolver(parent, args, context);
      return childResolver(parent, args, context);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

const checkAuth = createResolver((_, __, context) => {
  if (!context.req.user || !context.req.user.id) {
    throw new Error('Unauthorized, token is not valid!');
  }
});

export default checkAuth;
