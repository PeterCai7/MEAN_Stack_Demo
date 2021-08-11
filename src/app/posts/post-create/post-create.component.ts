import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { mimeTypeValidator } from './mime-type.validator';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy{
  //newTitle = 'Title';
  //newPost = 'Content';
  post: Post;
  isLoading = false;

  form: FormGroup;
  imagePreviewPath: string;

  private mode = 'createNewPosts';
  private postID: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {validators: [Validators.required]}),
      'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeTypeValidator]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postID')) {
        this.mode = 'editExistPosts';
        this.postID = paramMap.get('postID');
        //
        this.isLoading = true;
        this.postsService.getPost(this.postID).subscribe(postData => {
          //
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: null
          };
          this.form.setValue({'title': this.post.title, 'content': this.post.content, 'image': this.post.imagePath});
        });
      } else {
        this.mode = 'createNewPosts';
        this.postID = null;
        this.post = null;
      }
    });
  }

  onImagePicked(even: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({'image': file});
    this.form.get('image').updateValueAndValidity();
    console.log(file);
    console.log(this.form);
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewPath = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if(this.form.invalid) {
      return;
    }
    this.isLoading = true;
    //console.dir(postText);

    this.post = {
      id: this.postID,
      title: this.form.value.title,
      content: this.form.value.content,
      imagePath: null,
      creator: null
    };
    if(this.mode === 'createNewPosts') {
      this.postsService.addPost(this.post, this.form.value.image);
    } else {
      this.postsService.updatePost(this.post, this.form.value.image);
    }
    this.post = null;
    //this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
