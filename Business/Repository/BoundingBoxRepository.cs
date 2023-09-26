﻿using AutoMapper;
using Business.Repository.IRepository;
using DataAccess;
using DataAccess.Data;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Repository
{
	public class BoundingBoxRepository : IBoundingBoxRepository
	{
		private readonly AppDbContext _db;
		private readonly IMapper _mapper;

		public BoundingBoxRepository(AppDbContext db, IMapper mapper)
		{
			_db = db;
			_mapper = mapper;
		}

		public async ValueTask<int> Create(IEnumerable<BoundingBoxDTO> objDTOs)
		{
			var objs = _mapper.Map<IEnumerable<BoundingBoxDTO>, IEnumerable<BoundingBox>>(objDTOs);
			_db.BoundingBoxes.AddRange(objs);
			await _db.SaveChangesAsync();

			return objs.Count();
		}

		public ValueTask<int> Delete(int id)
		{
			throw new NotImplementedException();
		}

		public async ValueTask<IEnumerable<BoundingBoxDTO>> GetAll(int eventId)
		{
			return _mapper.Map<IEnumerable<BoundingBox>, IEnumerable<BoundingBoxDTO>>(_db.BoundingBoxes.Where(x => x.EventId == eventId));
		}
	}
}
