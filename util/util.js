const prepareComment = (comment) => {
  const {
    author,
    cID,
    upvoters,
    downvoters,
    actualComment,
    subComments,
  } = comment;

  return {
    author,
    cID,
    points: upvoters.length - downvoters.length,
    actualComment,
    subComments,
  };
};

exports.prepareComment = prepareComment;
