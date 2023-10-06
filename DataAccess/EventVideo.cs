﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess
{
	public class EventVideo
	{
		[Key]
		public int Id { get; set; }
        public string? UserId { get; set; }
        public int CameraId { get; set; }
        public string? Path { get; set; }
	}
}
