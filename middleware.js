const ExpressError = require('./utils/ExpressError');
const Post = require('./models/post');
const {postSchema,reviewSchema} = require('./schemas.js')
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next) =>{ 
if(!req.isAuthenticated()){
    req.session.returnTo = req.originalUrl;
    req.flash('error','You must login first')
    return res.redirect('/login');
  }
  next();
}

module.exports.validatePost = (req,res,next) => {
  const {error} = postSchema.validate(req.body);
  if(error)
  {
    const msg = error.details.map(el => el.message ).join(',');
    throw new ExpressError(msg,400);
  }
  else
  {
    next();
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/posts/${id}`);
  }
  next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id,reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/posts/${id}`);
  }
  next();
}

module.exports.validateReview = (req,res,next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error)
  {
    const msg = error.details.map(el => el.message ).join(',');
    throw new ExpressError(msg,400);
  }
  else
  {
    next();
  }
}

