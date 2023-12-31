﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
	public class EventVideoDTO
	{
		public int Id { get; set; }
		public string? UserId { get; set; }
		public IEnumerable<EventDTO> Events { get; set; }
        public string? Path { get; set; }
    }
}
