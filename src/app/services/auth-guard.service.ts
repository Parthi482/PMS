import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HelperService } from './helper.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanDeactivate<boolean> {

  constructor(public helperService: HelperService, public router: Router) { }

  canActivate(): boolean {

    if (!this.helperService.isLoggedIn()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return confirm('Discard unsaved changes?');
  }

}
