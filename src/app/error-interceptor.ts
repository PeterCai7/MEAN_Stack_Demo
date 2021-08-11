import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements  HttpInterceptor{
  constructor(private dialog: MatDialog) {}

  // like middleware, just for outgoing requests
  intercept(req: HttpRequest<any>, next: HttpHandler){
    return next.handle(req).pipe(
      //operator
      catchError((errorObj: HttpErrorResponse) => {
        let errorMessage = "An unknown error occurred!";
        // console.log(errorObj);
        // alert(errorObj.error.message);
        if(errorObj.error.message) {
          errorMessage = errorObj.error.message;
        }
        this.dialog.open(ErrorComponent, { data: {message: errorMessage}});
        return throwError(errorObj);
      })
    );
  }
}
