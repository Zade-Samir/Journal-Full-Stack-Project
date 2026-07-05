CREATE TABLE journal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    what_did_i_do TEXT,
    best_moment VARCHAR(255),
    worst_moment VARCHAR(255),
    what_i_learned TEXT,
    what_i_do_for_goal VARCHAR(255),
    feeling VARCHAR(255),
    feeling_note VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_user_id (user_id),
    INDEX idx_user_date (user_id, date),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_date_desc (date)
);

CREATE TABLE journal_gratitude (
    journal_id BIGINT NOT NULL,
    gratitude VARCHAR(255),
    FOREIGN KEY (journal_id) REFERENCES journal(id) ON DELETE CASCADE
);

CREATE TABLE journal_short_term_goal (
    journal_id BIGINT NOT NULL,
    short_term_goal VARCHAR(255),
    FOREIGN KEY (journal_id) REFERENCES journal(id) ON DELETE CASCADE
);

CREATE TABLE journal_long_term_goal (
    journal_id BIGINT NOT NULL,
    long_term_goal VARCHAR(255),
    FOREIGN KEY (journal_id) REFERENCES journal(id) ON DELETE CASCADE
);

CREATE TABLE goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    type VARCHAR(50) DEFAULT 'SHORT_TERM',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_goal_user_id (user_id),
    INDEX idx_goal_status (status),
    INDEX idx_goal_type (type)
);

CREATE TABLE journal_goal (
    journal_id BIGINT NOT NULL,
    goal_id BIGINT NOT NULL,
    PRIMARY KEY (journal_id, goal_id),
    FOREIGN KEY (journal_id) REFERENCES journal(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    INDEX idx_jg_journal (journal_id),
    INDEX idx_jg_goal (goal_id)
);
