def next_difficulty(score, current):

    levels = ["Easy", "Medium", "Hard"]

    idx = levels.index(current)

    if score >= 8 and idx < 2:
        return levels[idx + 1]

    elif score <= 4 and idx > 0:
        return levels[idx - 1]

    return current