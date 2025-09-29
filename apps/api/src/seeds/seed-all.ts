import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

function randomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

function randomPassword() {
  // Пароль: минимум 8 символов, одна заглавная, одна цифра, один спецсимвол
  const upper = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const lower = randomString(5);
  const digit = String(Math.floor(Math.random() * 10));
  const special = '@#$%&*!'[Math.floor(Math.random() * 7)];
  return upper + lower + digit + special;
}

function randomEmail() {
  return `${randomString(8)}@example.com`;
}

function randomUsername() {
  return `user_${randomString(6)}`;
}

function randomBio() {
  return `Bio: ${randomString(20)}`;
}

function randomAvatar() {
  // lorempicsum: 200x200, random id
  return `https://picsum.photos/seed/${randomString(8)}/200/200`;
}

function randomTrackTitle() {
  const genres = ['Rock', 'Pop', 'Jazz', 'Blues', 'HipHop', 'Electronic', 'Classical'];
  return `${genres[Math.floor(Math.random() * genres.length)]} Track ${randomString(5)}`;
}

function randomAlbumTitle() {
  const types = ['Greatest Hits', 'Live', 'EP', 'Anthology', 'Collection'];
  return `${types[Math.floor(Math.random() * types.length)]} ${randomString(4)}`;
}

function randomPlaylistTitle() {
  return `Playlist ${randomString(6)}`;
}

async function main() {
  try {
    console.log('🌱 Starting custom seeding...');
    await prisma.playlist.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.track.deleteMany();
    await prisma.album.deleteMany();
    await prisma.artist.deleteMany();

    // Artists
    const artists: Prisma.ArtistCreateManyInput[] = [];
    for (let i = 0; i < 30; i++) {
      artists.push({
        username: randomUsername(),
        email: randomEmail(),
        password: randomPassword(),
        bio: randomBio(),
        avatar: randomAvatar(),
        backgroundImage: `https://picsum.photos/seed/bg${randomString(8)}/800/400`
      });
    }
    await prisma.artist.createMany({ data: artists, skipDuplicates: true });

    // Albums
    const artistIds = (await prisma.artist.findMany({ select: { id: true } })).map(a => a.id);
    const albums: Prisma.AlbumCreateManyInput[] = [];
    for (let i = 0; i < 50; i++) {
      albums.push({
        title: randomAlbumTitle(),
        cover: `https://picsum.photos/seed/album${randomString(8)}/400/400`,
        artistId: artistIds[Math.floor(Math.random() * artistIds.length)],
        description: randomBio()
      });
    }
    await prisma.album.createMany({ data: albums, skipDuplicates: true });

    // Tracks
    const tracks: Prisma.TrackCreateManyInput[] = [];
    for (let i = 0; i < 150; i++) {
      tracks.push({
        title: randomTrackTitle(),
        audioUrl: `https://audio.example.com/tracks/${randomString(8)}.mp3`,
        cover: `https://picsum.photos/seed/track${randomString(8)}/400/400`,
        artistId: artistIds[Math.floor(Math.random() * artistIds.length)],
        // duration: Math.floor(Math.random() * 300) + 120 // если duration есть в модели
      });
    }
    await prisma.track.createMany({ data: tracks, skipDuplicates: true });

    // Users
    const users: Prisma.UserCreateManyInput[] = [];
    for (let i = 0; i < 100; i++) {
      users.push({
        username: randomUsername(),
        email: randomEmail(),
        password: randomPassword(),
        description: randomBio(),
        avatar: randomAvatar()
      });
    }
    await prisma.user.createMany({ data: users, skipDuplicates: true });

    // Playlists
    const userIds = (await prisma.user.findMany({ select: { id: true } })).map(u => u.id);
    const playlists: Prisma.PlaylistCreateManyInput[] = [];
    for (let i = 0; i < 200; i++) {
      playlists.push({
        title: randomPlaylistTitle(),
        description: randomBio(),
        cover: `https://picsum.photos/seed/playlist${randomString(8)}/400/400`,
        userId: userIds[Math.floor(Math.random() * userIds.length)]
      });
    }
    await prisma.playlist.createMany({ data: playlists, skipDuplicates: true });

    // LikedTracks (User <-> Track)
    const trackIds = (await prisma.track.findMany({ select: { id: true } })).map(t => t.id);
    for (const userId of userIds) {
      // Каждый пользователь лайкает от 5 до 50 случайных треков
      const likedCount = Math.floor(Math.random() * 46) + 5;
      const likedTracks = new Set<string>();
      while (likedTracks.size < likedCount) {
        likedTracks.add(trackIds[Math.floor(Math.random() * trackIds.length)]);
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          likedTracks: {
            connect: Array.from(likedTracks).map(id => ({ id }))
          }
        }
      });
    }

    console.log('✅ Custom seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
