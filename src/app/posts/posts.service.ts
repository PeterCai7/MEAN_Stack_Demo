import { Post } from "./post.model"
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators'

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from "../../environments/environment"
const BACKEND_Posts_URL = environment.apiURL + "/posts";


@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], totalNum: number}>();

    constructor(private httpclient: HttpClient, private router: Router) {

    }
    getPosts(numPerPage: number, currPage: number) {
      const queryParams = `?pageSize=${numPerPage}&currPage=${currPage}`;
      this.httpclient.get<{message: string, posts: any, totalNum: number }>(BACKEND_Posts_URL + "/" + queryParams)
        .pipe(
          map((resArr) => {
            return {
              posts: resArr.posts.map(post => {
                return {
                  id: post._id,
                  title: post.title,
                  content: post.content,
                  imagePath: post.imagePath,
                  creator: post.creator
                };
              }),
              totalNum: resArr.totalNum
            };
        }))
        .subscribe((resObj) => {
          this.posts = resObj.posts;
          this.postsUpdated.next({posts: [...this.posts], totalNum: resObj.totalNum});
        });
    }

    getPost(id: string) {
      return this.httpclient.get<{_id: string, title: string, content: string, imagePath: string}>(
        BACKEND_Posts_URL + "/" + id
      );
    }

    postsUpdatedListener() {
      return this.postsUpdated.asObservable();
    }

    addPost(post: Post, image: File) {
      const postData = new FormData();
      postData.append("title", post.title);
      postData.append("content", post.content);
      postData.append("image", image, post.title);
      this.httpclient.post<{message: string, post: Post}>(BACKEND_Posts_URL, postData)
        .subscribe((response) => {
          console.log(response.message);
          // post.id = response.post.id;
          // post.imagePath = response.post.imagePath;
          // this.posts.push(post);
          // this.postsUpdated.next([...this.posts]);
          //navigating would cause reloading the updatedPosts
          this.router.navigate(["/"]);
        }, (error) => {
          console.log(error);
          this.router.navigate(["/"]);
        });
    }

    updatePost(post: Post, image: File | string) {
      let postData: Post | FormData;
      if(typeof(image) === 'object') {
        postData = new FormData();
        postData.append("id", post.id)
        postData.append("title", post.title);
        postData.append("content", post.content);
        postData.append("image", image, post.title);
      } else {
        postData = post;
        post.imagePath = image;
      }
      this.httpclient.put<{message: string, imagePath: string}>(BACKEND_Posts_URL + "/" + post.id, postData)
        .subscribe( (response) => {
          console.log(response.message);
          // const oldPostIndex = this.posts.findIndex(p => p.id === post.id);
          // post.imagePath = response.imagePath;
          // this.posts[oldPostIndex] = post;
          // this.postsUpdated.next([...this.posts]);
          // cause reloading below
          this.router.navigate(["/"]);
        });
    }

    deletePost(id: String) {
      return this.httpclient.delete<{message: string}>(BACKEND_Posts_URL + "/" + id);
    }
}
