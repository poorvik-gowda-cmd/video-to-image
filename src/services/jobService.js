const prisma = require('../utils/prisma');

class JobService {
  async createJob(fileName) {
    return await prisma.job.create({
      data: {
        fileName,
        status: 'PENDING',
      },
    });
  }

  async getJobById(id) {
    return await prisma.job.findUnique({
      where: { id },
    });
  }

  async updateJobStatus(id, status, error = null) {
    return await prisma.job.update({
      where: { id },
      data: {
        status,
        error,
      },
    });
  }

  async getAllJobs() {
    return await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new JobService();
