﻿using System.ComponentModel.DataAnnotations;

namespace Departments.Models
{
    public class Instructor
    {
        public int Id { get; set; }

        public string SSN { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }

        public int Age { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public int Salary { get; set; }

        public DateTime DOB { get; set; }

        public int DepartmentId { get; set; }
        public virtual Department? Department { get; set; }
    }
}
