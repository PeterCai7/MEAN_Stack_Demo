const PostSchema = require('../models/post');


exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new PostSchema({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  //console.log(post);
  //console.log(req.userData);
  //return res.status(200).json({});
  post.save().then(createdPost => {
    console.log(createdPost);
    res.status(201).json(
      {
        message: "Post added sucessfully!",
        post: {
          ...createdPost,
          id: createdPost._id,
          // title: createdPost.title,
          // content: createdPost.content,
          // imagePath: createdPost.imagePath
        }
      }
    );
  }).catch(error => {
    console.log(error);
    res.status(500).json({ message: "Creating a post failed!"});
  });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  // authorization done
  // update in this way is ok? Yes
  PostSchema.updateOne({ _id: req.body.id, creator: req.userData.userId }, {title: req.body.title, content: req.body.content, imagePath: imagePath})
    .then((result) => {
      console.log(result);
      if(result.n > 0) {
        res.status(200).json({message: "Post Updated!", imagePath: imagePath});
      }
      else {
        res.status(401).json({message: "Not authorized!"});
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't update posts beause of server issues!"
      });
    }); // catch technical errors
};

exports.fetchPosts = (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currPage = +req.query.currPage;
  const postsQuery = PostSchema.find();
  let fetchedPosts;
  if(pageSize && currPage) {
    postsQuery
      .skip(pageSize * (currPage - 1))
      .limit(pageSize);
  }
  postsQuery
    .then(documents => {
      fetchedPosts = documents;
      return PostSchema.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched sucessfully!',
        posts: fetchedPosts,
        totalNum: count
      });
    })
    .catch( error => {
      res.status(500).json({
        message:  "Fetching posts failed"
      })
    });
};

exports.fetchOnePost = (req, res, next) => {
  PostSchema.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found!'});
    }
  })
  .catch( error => {
    res.status(500).json({
      message:  "Fetching one post failed"
    })
  });
};

exports.deletePost = (req, res, next) => {
  //console.log(req.params.id);
  PostSchema.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result);
      if(result.n > 0) {
        res.status(200).json({ message: "Post Deleted!" });
      }
      else {
        res.status(401).json({message: "Not authorized!"});
      }
    })
    .catch( error => {
      res.status(500).json({
        message:  "Deleting one post failed"
      })
    });
};
