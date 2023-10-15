﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
	public class EventVideoDTO
	{
		public int Id { get; set; }
        public string? Date { get; set; }
        public string? UserId { get; set; }
		public int CameraId { get; set; }
        public string? Labels { get; set; }
        public string? Path { get; set; }
    }
}
