import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentinteamComponent } from './studentinteam.component';

describe('StudentinteamComponent', () => {
  let component: StudentinteamComponent;
  let fixture: ComponentFixture<StudentinteamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentinteamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentinteamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
