import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursepreferenceComponent } from './coursepreference.component';

describe('CoursepreferenceComponent', () => {
  let component: CoursepreferenceComponent;
  let fixture: ComponentFixture<CoursepreferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursepreferenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursepreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
