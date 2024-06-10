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

productController.checkStock = async (item) => {
    //내가 사려는 아이템 재고 정보 들고 오기
    const product = await Product.findById(item.productId)
    //내가 사려는 아이템 qty, 재고 비교
    if (product.stock[item.size] < item.qty) {
        //재고가 불충분 하면 불충분 메세지와 함께 데이터 반환
        return {isVerify: false, message: `${product.name}is out of stock: ${item.size}`}
    }

    const newStock = { ...product.stock }
    newStock[item.size] -= item.qty
    product.stock = newStock

    await product.save()
    //충분하다면, 재고에서 - qty 성공
    return {isVerify: true}
}

productController.checkItemListStock = async (itemList) => {
    const insufficientStockItems = []
    //재고 확인 로직
    //비동기 처리를 동시에 처리해준다
    await Promise.all(
        itemList.map((item) => {
            const stockCheck = productController.checkStock(item)
        if (!stockCheck.isVerify) {
            insufficientStockItems.push({item, message: stockCheck.message})
        }
        return stockCheck
        })
    )
    
    return insufficientStockItems
}

module.exports = productController;