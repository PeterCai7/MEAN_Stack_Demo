const express = require("express");

const checkAuth = require("../middleware/check-auth");

const PostController = require("../controllers/postController");

const postsRouter = express.Router();



const extractFile = require("../middleware/file");

postsRouter.post("", checkAuth, extractFile, PostController.createPost);

postsRouter.put("/:id", checkAuth, extractFile, PostController.updatePost);

postsRouter.get("", PostController.fetchPosts);

postsRouter.get("/:id", PostController.fetchOnePost);

postsRouter.delete("/:id", checkAuth, PostController.deletePost);

module.exports = postsRouter;
