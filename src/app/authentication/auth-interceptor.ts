import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()

export class AuthInterceptor implements  HttpInterceptor{
  constructor(private authService: AuthService) {}

  // like middleware, just for outgoing requests
  intercept(req: HttpRequest<any>, next: HttpHandler){
    const authToken = this.authService.getToken();
    const newRequest = req.clone({
      // set() will not overwrite old headers
      headers: req.headers.set('authorization', "Bearer " + authToken)
    });
    return next.handle(newRequest);
  }
}
