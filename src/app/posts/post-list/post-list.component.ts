import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{
  posts: Post[] = [];
  isLoading = false;
  totalNumPosts = 0;
  numPerPage = 2;
  currPage = 1;
  numOptions = [2, 5, 10, 15];
  userAuthenticated = false;
  userId: string;

  private postsSub: Subscription;

  private authStatusSub: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) {
    this.postsService = postsService;
  }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.numPerPage, this.currPage);
    this.postsSub = this.postsService.postsUpdatedListener().subscribe(
      (postsData: {posts: Post[], totalNum: number}) => {
        this.posts = postsData.posts;
        this.totalNumPosts = postsData.totalNum;
        this.isLoading = false;
      });
    //very important, for the first time this component is loaded
    this.userAuthenticated = this.authService.getAuthStatus();
    this.userId = this.authService.getUserId();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userAuthenticated = isAuthenticated;
        // very important to add this line
        this.userId = this.authService.getUserId();
      });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    console.log(pageData);
    this.currPage = pageData.pageIndex + 1;
    this.numPerPage = pageData.pageSize;
    this.postsService.getPosts(this.numPerPage, this.currPage);
  }

  onDelete(PID: String) {
    this.isLoading = true;
    this.postsService.deletePost(PID).subscribe((res) => {
      console.log(res);
      this.postsService.getPosts(this.numPerPage, this.currPage);
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
