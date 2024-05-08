class Piece {
  constructor(colour, name) {
    this.colour = colour;
    this.name = name;
  }
}

class Pawn extends Piece {
  // we need to know this to determine whether we can move two places or not.
  hasMoved = false;

  constructor(colour, name) {
    super(colour, name);
  }
}

class Bishop extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

class Knight extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

class Rook extends Piece {
  hasMoved = false;

  constructor(colour, name) {
    super(colour, name);
  }
}

class King extends Piece {
  // we need to know this to determine whether we can castle or not.
  hasCastled = false;
  hasChecked = false;
  hasMoved = false;

  constructor(colour, name) {
    super(colour, name);
  }
}

class Queen extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

class Empty extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

class Death extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

class Fear extends Piece {
  constructor(colour, name) {
    super(colour, name);
  }
}

module.exports = {
  Piece,
  Pawn,
  Knight,
  Rook,
  Bishop,
  King,
  Queen,
  Empty,
  Death,
  Fear,
};
