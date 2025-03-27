const handleResolverError = (resolver) => async(parent, args, context, info) => {
    
    if(!context.pool){
        throw new Error('Database pool not available in context.');
    }

    try {
        return await resolver(parent, args, context, info);
    } catch (error) {
        console.error(error);
        throw new Error(error.message+":Internal Server Error"); 
    }
}

export default handleResolverError;