import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message: String = ""; // get message and types
  type: String = "NONE";
  types: String[] = ["SUCCESS", "INFO", "WARNING", "DANGER"]; // Only SUCCESS/INFO/WARNING/DANGER are allowed

  update(message: String, type: String) {
    if(this.types.includes(type)) {
      this.message = message;
      this.type = type;
    }
  }

  clear() {
    this.message = "";
    this.type = "";
  }
}
