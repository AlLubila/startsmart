import { NextResponse } from 'next/server';
import clientPromise from '@/../lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('startsmartdb');
    const applications = db.collection('applications');

    const favorites = await applications.find({ userId }).toArray();
    
    // Return consistent structure
    return NextResponse.json(favorites.map(fav => fav.job));
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { job } = await req.json();
    if (!job?.id) {
      return NextResponse.json({ error: 'Job data required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('startsmartdb');
    const favorites = db.collection('applications'); // Keeping your collection name

    // Use the exact same structure that DELETE will look for
    const doc = {
      userId,
      job: {
        id: String(job.id), // Ensure consistent string format
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        redirectUrl: job.redirectUrl
      },
      createdAt: new Date()
    };

    await favorites.updateOne(
      { userId, 'job.id': String(job.id) },
      { $set: doc },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}