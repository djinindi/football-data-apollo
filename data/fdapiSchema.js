import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';

import { makeExecutableSchema } from 'graphql-tools';
import {
  getDataWithFilters,
  getDataFromLink,
  getDataFromTypeAndId,
  fetchData
} from '../apiHelper';

const schemaString = `
schema {
  query: Query
}

type Query {
  competition(id: ID!, season: Int): Competition
  team(id: ID!): Team
  fixture(id: ID!): Fixture
}

type Competition {
  id: ID!
  name: String
  league: String
  year: String
  currentMatchday: Int
  numberOfMatchdays: Int
  numberOfTeams: Int
  numberOfGames: Int
  teams: [Team]
  fixtures: [Fixture]
}

type Team {
  name: String
  code: String
  shortName: String
  squadMarketValue: String
  crestUrl: String
  players: [Player]
}

type Player {
  name: String
  position: String
  jerseyNumber: Int
  dateOfBirth: String
  nationality: String
  contractUntil: String
  marketValue: String
}

type Fixture {
  date: String
  status: FixtureStatus
  matchday: Int
  competition: Competition
  homeTeam: Team
  awayTeam: Team
  result: Results
  odds: Odds
}

type Results {
  goalsHomeTeam: Int
  goalsAwayTeam: Int
  halfTime: Result
  extraTime: Result
  penaltyShootout: Result
}

type Result {
  goalsHomeTeam: Int
  goalsAwayTeam: Int
}

type Odds {
  homeWin: Float
  draw: Float
  awayWin: Float
}

enum FixtureStatus {
  SCHEDULED
  TIMED
  IN_PLAY
  FINISHED
  POSTPONED
  CANCELED
}
`;

const resolvers = {
  Query: {
    competition: async (root, { id, season }) => {
      console.log(season);
      if (season) {
        return await getDataWithFilters('competitions', id, {season});
      } else {
        return await getDataFromTypeAndId('competitions', id);
      }
    },
    team: async (root, { id }) => await getDataFromTypeAndId('teams', id),
    fixture: async (root, { id }) => await getDataFromTypeAndId('fixtures', id)
  },
  Competition: {
    name: (comp) => comp.caption,
    teams: async (comp) => await getDataFromLink(comp._links.teams.href),
    fixtures: async (comp) => await getDataFromLink(comp._links.fixtures.href)
  },
  Team: {
    players: async (team) => await getDataFromLink(team._links.players.href)
  },
  Fixture: {
    homeTeam: async ({ fixture }) => await fetchData(fixture._links.homeTeam.href),
    awayTeam: async ({ fixture }) => await fetchData(fixture._links.awayTeam.href),
    competition: async ({ fixture }) => await fetchData(fixture._links.competition.href),
    result: ({ fixture }) => fixture.result,
    odds: ({ fixture }) => fixture.odds,
    matchday: ({ fixture }) => fixture.matchday,
    date: ({ fixture }) => fixture.date,
    status: ({ fixture }) => fixture.status
  },
  Results: {
    halfTime: (res) => res.halfTime,
    extraTime: (res) => res.extraTime,
    penaltyShootout: (res) => res.penaltyShootout
  }
}

export const FootballDataSchema = makeExecutableSchema({
  typeDefs: [schemaString],
  resolvers
});
