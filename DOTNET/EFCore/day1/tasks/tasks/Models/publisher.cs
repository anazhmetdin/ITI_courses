﻿// <auto-generated> This file has been auto generated by EF Core Power Tools. </auto-generated>
#nullable disable
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace tasks.Models;

public partial class publisher
{
    [Key]
    [StringLength(4)]
    [Unicode(false)]
    public string pub_id { get; set; }

    [StringLength(40)]
    [Unicode(false)]
    public string pub_name { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string city { get; set; }

    [StringLength(2)]
    [Unicode(false)]
    public string state { get; set; }

    [StringLength(30)]
    [Unicode(false)]
    public string country { get; set; }

    [InverseProperty("pub")]
    public virtual ICollection<title> titles { get; } = new List<title>();
}