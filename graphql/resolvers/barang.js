const barangResolver = {
    Query: {
        barang: () => {
            // Logic to fetch barang data from database or any other source
            const barangData = {
                id: 1,
                name: "Barang 1",
                price: 10.99,
            };
            return barangData;
        },
    },
    Mutation: {
        addBarang: (_, { input }) => {
            // Logic to add new barang to the database or any other source
            const newBarang = {
                id: 2,
                name: input.name,
                price: input.price,
            };
            return newBarang;
        },
        updateBarang: (_, { id, input }) => {
            // Logic to update existing barang in the database or any other source
            const updatedBarang = {
                id: id,
                name: input.name,
                price: input.price,
            };
            return updatedBarang;
        },
    },
};

export default barangResolver;


export default null;