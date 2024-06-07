const Product = require('../models/Product');
const PAGE_SIZE = 6;

const productController = {}

productController.createProduct = async (req, res) => {
    try {
        const { sku, name, size, image, category, description, price, stock, status } = req.body;
        const product = new Product({
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        });
        await product.save();
        res.status(200).json({status: "success", product})
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

productController.getProducts = async (req, res) => {
    try {
        const { page, name } = req.query;
        const cond = name ? { name: { $regex: name, $options: "i" }, isDeleted: false } : { isDeleted: false}
        let query = Product.find(cond)
        let response = { status: "success" }
        if (page) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
            //최종 몇개 페이지, 데이터가 총 몇개있는지
            const totalItemNum = await Product.find(cond).count();
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }
        const productList = await query.exec()
        response.data = productList
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) throw new Error("Item doesn't exist");
        res.status(200).json({ status: "success", data: product });
    } catch (error) {
        return res.status(400).json({status: "fail", error: error.message})
    }
}

productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            sku,
            name,
            size,
            image,
            price,
            description,
            category,
            stock,
            status,
        } = req.body;

        const product = await Product.findByIdAndUpdate({ _id: productId },
            { sku, name, size, image, price, description, category, stock, status }, { new: true }
        )
        if (!product) throw new Error("Item doesn't exist")
        res.status(200).json({ status: "success", data: product })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            { isDeleted: true }
        );
        if (!product) throw new Error("Item doesn't exist");
        res.status(200).json({status: "Success"})
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message})
    }
}

module.exports = productController;