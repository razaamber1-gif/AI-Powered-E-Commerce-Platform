const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get the current user's cart with full product details populated.
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const total = cart.items.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);

    res.json({ cart, total, itemCount: cart.items.length });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a product to the cart (or increase quantity if already there).
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existing = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }
    await cart.save();
    await cart.populate('items.product');

    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove a product entirely from the cart.
 * @route   DELETE /api/cart/remove/:productId
 * @access  Private
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
    await cart.save();
    await cart.populate('items.product');

    res.json({ message: 'Removed from cart', cart });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update quantity of a single cart item. Quantity 0 removes it.
 * @route   PUT /api/cart/update
 * @access  Private
 */
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null) {
      return res.status(400).json({ message: 'productId and quantity required' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Clear entire cart.
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
